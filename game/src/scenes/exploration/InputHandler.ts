import Phaser from 'phaser';

import { MapRenderer } from './MapRenderer';
import { Node } from './types';

export class InputHandler {
    private scene: Phaser.Scene;
    private mapRenderer: MapRenderer;
    private currentNode: Node;
    private onNodeSelected: (node: Node) => void;

    constructor(
        scene: Phaser.Scene,
        mapRenderer: MapRenderer,
        currentNode: Node,
        onNodeSelected: (node: Node) => void
    ) {
        this.scene = scene;
        this.mapRenderer = mapRenderer;
        this.currentNode = currentNode;
        this.onNodeSelected = onNodeSelected;

        this.setupInputHandling();
    }

    updateState(currentNode: Node) {
        this.currentNode = currentNode;
    }

    private setupInputHandling() {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const x = pointer.x + this.scene.cameras.main.scrollX;
            const y = pointer.y + this.scene.cameras.main.scrollY;
            this.handleNodeSelection(x, y);
        });
    }

    private handleNodeSelection(x: number, y: number) {
        const clickedNode = this.mapRenderer.findClosestNode(x, y);
        
        if (clickedNode) {
            const isSelectable = this.currentNode.connections.some(conn =>
                conn.targetLevel === clickedNode.level && conn.targetLane === clickedNode.lane
            );

            if (isSelectable) {
                this.animateMovement(clickedNode);
            }
        }
    }

    private animateMovement(targetNode: Node) {
        const startPos = this.mapRenderer.getNodeScreenPosition(this.currentNode);
        const endPos = this.mapRenderer.getNodeScreenPosition(targetNode);
        
        // ノードへの移動をアニメーション
        const moveMarker = this.scene.add.circle(startPos.x, startPos.y, 10, 0xff0000);
        
        this.scene.tweens.add({
            targets: moveMarker,
            x: endPos.x,
            y: endPos.y,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                moveMarker.destroy();
                
                // カメラを移動
                const targetY = this.mapRenderer.calculateCameraY(targetNode);
                this.scene.cameras.main.pan(
                    0,
                    targetY,
                    500,
                    'Power2'
                );

                // ノード選択のコールバックを実行
                this.onNodeSelected(targetNode);
            }
        });
    }
}