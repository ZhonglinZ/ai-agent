import { Node, XYPosition } from '@xyflow/react';

const NODE_WIDTH = 220; 
const NODE_HEIGHT = 100;
const BUFFER = 4; // 只有 4px 的超窄缝隙，视觉极度紧凑

const getBounds = (node: Node | { position: XYPosition; measured?: { width: number; height: number } }) => {
    const x = node.position.x;
    const y = node.position.y;
    // 优先使用真实测量尺寸
    const w = 'measured' in node ? (node.measured?.width || NODE_WIDTH) : NODE_WIDTH;
    const h = 'measured' in node ? (node.measured?.height || NODE_HEIGHT) : NODE_HEIGHT;
    return { left: x, right: x + w, top: y, bottom: y + h, width: w, height: h };
};

// 简单的矩形碰撞检测
const checkCollision = (r1: ReturnType<typeof getBounds>, r2: ReturnType<typeof getBounds>) => {
    return !(
        r2.left >= r1.right + BUFFER ||
        r2.right <= r1.left - BUFFER ||
        r2.top >= r1.bottom + BUFFER ||
        r2.bottom <= r1.top - BUFFER
    );
};

/**
 * 刚体位置修正算法
 */
export const getValidPosition = (
    draggedNode: Node,
    originalNode: Node, // 关键：传入上一帧的位置作为参考
    otherNodes: Node[]
): XYPosition => {
    let currentBounds = getBounds(draggedNode);
    let newX = draggedNode.position.x;
    let newY = draggedNode.position.y;
    
    // 获取"碰撞前"的边界，作为方位判断基准
    const originalBounds = getBounds(originalNode);

    for (const other of otherNodes) {
        const otherBounds = getBounds(other);

        if (checkCollision(currentBounds, otherBounds)) {
            // === 发生碰撞，开始修正 ===
            
            // 1. 如果之前在左边，就锁死在左边
            if (originalBounds.right <= otherBounds.left + BUFFER) {
                newX = otherBounds.left - currentBounds.width - BUFFER;
            }
            // 2. 如果之前在右边，就锁死在右边
            else if (originalBounds.left >= otherBounds.right - BUFFER) {
                newX = otherBounds.right + BUFFER;
            }
            // 3. 上方
            else if (originalBounds.bottom <= otherBounds.top + BUFFER) {
                newY = otherBounds.top - currentBounds.height - BUFFER;
            }
            // 4. 下方
            else if (originalBounds.top >= otherBounds.bottom - BUFFER) {
                newY = otherBounds.bottom + BUFFER;
            }
            // 5. 降级容错（处理瞬移重叠的情况）
            else {
                 const distLeft = (currentBounds.right + BUFFER) - otherBounds.left;
                 const distRight = otherBounds.right + BUFFER - currentBounds.left;
                 const distTop = (currentBounds.bottom + BUFFER) - otherBounds.top;
                 const distBottom = otherBounds.bottom + BUFFER - currentBounds.top;
                 const minDist = Math.min(distLeft, distRight, distTop, distBottom);
                 
                 if (minDist === distLeft) newX -= distLeft;
                 else if (minDist === distRight) newX += distRight;
                 else if (minDist === distTop) newY -= distTop;
                 else if (minDist === distBottom) newY += distBottom;
            }
            
            // 更新当前位置，继续检测下一个障碍物
            currentBounds = {
                ...currentBounds,
                left: newX,
                right: newX + currentBounds.width,
                top: newY,
                bottom: newY + currentBounds.height
            };
        }
    }

    return { x: newX, y: newY };
};