import Phaser from 'phaser';
import { Action, NODE_ACTIONS, Node, NodeType } from './types';

export class ActionSelector {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private actionButtons: Phaser.GameObjects.Container[] = [];
    private visible: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // コンテナを作成（非表示で初期化）
        this.container = this.scene.add.container(0, 0);
        this.container.setVisible(false);

        // 半透明の背景を作成
        this.background = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            0,
            this.scene.cameras.main.width,
            60,
            0x000000,
            0.7
        );
        this.background.setScrollFactor(0);
        this.container.add(this.background);

        // 画面下部に配置
        this.container.setPosition(0, this.scene.cameras.main.height - 200);
    }

    public show(node: Node, onActionSelected: (action: Action) => void): void {
        // 既存のボタンをクリア
        this.actionButtons.forEach(button => button.destroy());
        this.actionButtons = [];

        // ノードタイプに応じた行動を取得
        const actions = NODE_ACTIONS[node.type];

        // 行動ボタンを作成
        actions.forEach((action, index) => {
            const buttonWidth = 120;
            const buttonHeight = 40;
            const padding = 10;
            const totalWidth = actions.length * (buttonWidth + padding) - padding;
            const startX = (this.scene.cameras.main.width - totalWidth) / 2;
            const x = startX + index * (buttonWidth + padding);

            // ボタンのコンテナ
            const buttonContainer = this.scene.add.container(x, 10);

            // ボタンの背景
            const background = this.scene.add.rectangle(
                0,
                0,
                buttonWidth,
                buttonHeight,
                0x4a5568,
                1
            );
            background.setStrokeStyle(2, 0x718096);
            background.setScrollFactor(0);
            buttonContainer.add(background);

            // ボタンのテキスト
            const nameText = this.scene.add.text(
                0,
                0,
                action.name,
                {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'Arial'
                }
            );
            nameText.setOrigin(0.5);
            nameText.setScrollFactor(0);
            buttonContainer.add(nameText);

            // クリックイベントの設定
            background.setInteractive()
                .on('pointerover', () => {
                    background.setFillStyle(0x718096);
                })
                .on('pointerout', () => {
                    background.setFillStyle(0x4a5568);
                })
                .on('pointerdown', () => {
                    console.log(`Action selected: ${action.id}`);
                    onActionSelected(action);
                });

            this.actionButtons.push(buttonContainer);
            this.container.add(buttonContainer);
        });

        // UIを表示
        this.container.setVisible(true);
        this.visible = true;
    }

    public hide(): void {
        this.container.setVisible(false);
        this.visible = false;
    }

    public isVisible(): boolean {
        return this.visible;
    }
}