import { Scene } from 'phaser';

interface ArcMachineStatus {
    name: string;
    hp: number;
    manaCapacity: number;
    manaGeneration: number;
    currentCircuit: string;
}

interface CircuitSlot {
    x: number;
    y: number;
    orb: string | null;
}

interface Circuit {
    id: string;
    name: string;
    slots: CircuitSlot[];
    startPoint: { x: number; y: number };
}

export class BuildScene extends Scene {
    private status: ArcMachineStatus = {
        name: "テスト魔導機",
        hp: 1000,
        manaCapacity: 100,
        manaGeneration: 5,
        currentCircuit: "基本回路"
    };

    private circuits: Circuit[] = [
        {
            id: "circuit1",
            name: "基本回路",
            slots: [
                { x: 0, y: 0, orb: null },
                { x: 1, y: 0, orb: null },
                { x: 0, y: 1, orb: null }
            ],
            startPoint: { x: 0, y: 0 }
        }
    ];

    private orbs: string[] = ["マナの矢", "ファイアボール", "アイスシャード"];
    private currentCircuit!: Circuit;
    private selectedOrb: string | null = null;

    constructor() {
        super({ key: 'BuildScene' });
    }

    create() {
        this.currentCircuit = this.circuits[0];
        this.createLayout();
    }

    private createLayout() {
        const { width, height } = this.cameras.main;

        // ヘッダー
        this.createHeader();

        // メインコンテンツエリア
        const headerHeight = 80;
        const remainingHeight = height - headerHeight;
        
        // 上段: ステータス表示（20%）
        const statusHeight = remainingHeight * 0.2;
        this.createStatusView(0, headerHeight, width, statusHeight);

        // 中段: 回路ビュー（50%）
        const circuitY = headerHeight + statusHeight;
        const circuitHeight = remainingHeight * 0.5;
        this.createCircuitView(0, circuitY, width, circuitHeight);

        // 下段: インベントリ（30%）
        const inventoryY = circuitY + circuitHeight;
        const inventoryHeight = remainingHeight * 0.3;
        this.createInventoryView(0, inventoryY, width, inventoryHeight);
    }

    private createHeader() {
        // 戻るボタン
        const backButton = this.add.text(
            20,
            20,
            '← 探索に戻る',
            {
                fontSize: '24px',
                color: '#ffffff',
            }
        ).setInteractive();

        backButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('ExplorationScene', { fromBuild: true });
            });
        });

        // 魔導機名
        this.add.text(
            this.cameras.main.centerX,
            20,
            this.status.name,
            {
                fontSize: '28px',
                color: '#ffffff',
            }
        ).setOrigin(0.5, 0);

        // 保存ボタン
        const saveButton = this.add.text(
            this.cameras.main.width - 100,
            20,
            '保存',
            {
                fontSize: '24px',
                color: '#ffffff',
            }
        ).setInteractive();

        saveButton.on('pointerdown', () => {
            // TODO: 保存処理の実装
            console.log('設定を保存しました');
        });
    }

    private createStatusView(x: number, y: number, width: number, height: number) {
        // 枠線
        this.add.rectangle(x, y, width, height)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);

        const padding = 20;
        const columnWidth = (width - padding * 3) / 2;
        
        // 左列のステータス情報
        this.add.text(
            x + padding,
            y + padding,
            [
                `HP: ${this.status.hp}`,
                `マナ容量: ${this.status.manaCapacity}`,
            ].join('\n'),
            {
                fontSize: '20px',
                color: '#ffffff',
            }
        );

        // 右列のステータス情報
        this.add.text(
            x + padding * 2 + columnWidth,
            y + padding,
            [
                `マナ生成: ${this.status.manaGeneration}/秒`,
                `現在の回路: ${this.status.currentCircuit}`,
            ].join('\n'),
            {
                fontSize: '20px',
                color: '#ffffff',
            }
        );

        // セクションタイトル
        this.add.text(
            x + padding,
            y + 5,
            'ステータス',
            {
                fontSize: '16px',
                color: '#aaaaaa',
            }
        );
    }

    private createCircuitView(x: number, y: number, width: number, height: number) {
        // 枠線
        this.add.rectangle(x, y, width, height)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);

        // セクションタイトル
        this.add.text(
            x + 20,
            y + 5,
            '魔導回路',
            {
                fontSize: '16px',
                color: '#aaaaaa',
            }
        );

        // 回路の描画エリアを計算
        const padding = 40;
        const titleHeight = 30;
        const circuitArea = {
            x: x + padding,
            y: y + padding + titleHeight,
            width: width - padding * 2,
            height: height - padding * 2 - titleHeight
        };

        // スロットサイズを画面サイズに応じて計算
        const maxSlotX = this.getMaxSlotX();
        const maxSlotY = this.getMaxSlotY();
        const maxSlotSize = Math.min(
            circuitArea.width / (maxSlotX + 2),  // 左右の余白用に+2
            circuitArea.height / (maxSlotY + 2)  // 上下の余白用に+2
        );
        const slotSize = Math.min(maxSlotSize * 0.8, 100); // 最大100pxに制限
        const slotSpacing = slotSize * 1.5; // スロット間の距離

        // 回路全体のサイズを計算
        const circuitWidth = (maxSlotX + 1) * slotSpacing;
        const circuitHeight = (maxSlotY + 1) * slotSpacing;

        // 回路を中央に配置するためのオフセットを計算
        const offsetX = circuitArea.x + (circuitArea.width - circuitWidth) / 2;
        const offsetY = circuitArea.y + (circuitArea.height - circuitHeight) / 2;

        // 接続線の描画
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff, 0.5);
        for (let i = 0; i < this.currentCircuit.slots.length - 1; i++) {
            const currentSlot = this.currentCircuit.slots[i];
            const nextSlot = this.currentCircuit.slots[i + 1];
            const startX = offsetX + (currentSlot.x * slotSpacing) + slotSize/2;
            const startY = offsetY + (currentSlot.y * slotSpacing) + slotSize/2;
            const endX = offsetX + (nextSlot.x * slotSpacing) + slotSize/2;
            const endY = offsetY + (nextSlot.y * slotSpacing) + slotSize/2;
            graphics.lineBetween(startX, startY, endX, endY);
        }

        // スロットの描画
        this.currentCircuit.slots.forEach((slot, index) => {
            const slotX = offsetX + (slot.x * slotSpacing);
            const slotY = offsetY + (slot.y * slotSpacing);

            // スロット背景
            const slotBg = this.add.rectangle(slotX, slotY, slotSize, slotSize)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0)
                .setInteractive()
                .on('pointerdown', () => this.handleSlotClick(index));

            // 装備中の宝珠があれば表示
            if (slot.orb) {
                this.add.text(
                    slotX + slotSize/2,
                    slotY + slotSize/2,
                    slot.orb,
                    {
                        fontSize: '16px',
                        color: '#ffff00',
                    }
                ).setOrigin(0.5);
            }

            // スロット番号を表示（デバッグ用）
            this.add.text(
                slotX + 5,
                slotY + 5,
                `${index}`,
                {
                    fontSize: '12px',
                    color: '#888888',
                }
            );
        });

        // 開始地点の表示
        const startSlot = this.currentCircuit.slots[0];
        const startX = offsetX + (startSlot.x * slotSpacing);
        const startY = offsetY + (startSlot.y * slotSpacing);
        this.add.text(
            startX,
            startY - 20,
            'Start',
            {
                fontSize: '16px',
                color: '#00ff00',
            }
        );
    }

    private createInventoryView(x: number, y: number, width: number, height: number) {
        // 枠線
        this.add.rectangle(x, y, width, height)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);

        // セクションタイトル
        this.add.text(
            x + 20,
            y + 5,
            'インベントリ',
            {
                fontSize: '16px',
                color: '#aaaaaa',
            }
        );

        const padding = 20;
        const titleHeight = 30;
        const columnWidth = (width - padding * 3) / 2;

        // 左側: 所持回路リスト
        const circuitListX = x + padding;
        const circuitListY = y + padding + titleHeight;
        const listHeight = height - padding * 2 - titleHeight;

        // 回路リストの背景
        this.add.rectangle(circuitListX, circuitListY, columnWidth, listHeight)
            .setStrokeStyle(1, 0x444444)
            .setOrigin(0);

        this.add.text(
            circuitListX + 10,
            circuitListY + 5,
            '所持回路',
            {
                fontSize: '18px',
                color: '#ffffff',
            }
        );

        let currentY = circuitListY + 40;
        this.circuits.forEach(circuit => {
            this.add.text(
                circuitListX + 10,
                currentY,
                circuit.name,
                {
                    fontSize: '16px',
                    color: circuit.id === this.currentCircuit.id ? '#ffff00' : '#ffffff',
                }
            ).setInteractive()
            .on('pointerdown', () => this.handleCircuitSelect(circuit.id));
            
            currentY += 30;
        });

        // 右側: 宝珠インベントリ
        const orbListX = x + padding * 2 + columnWidth;
        const orbListY = circuitListY;

        // 宝珠リストの背景
        this.add.rectangle(orbListX, orbListY, columnWidth, listHeight)
            .setStrokeStyle(1, 0x444444)
            .setOrigin(0);

        this.add.text(
            orbListX + 10,
            orbListY + 5,
            '所持宝珠',
            {
                fontSize: '18px',
                color: '#ffffff',
            }
        );

        currentY = orbListY + 40;
        this.orbs.forEach(orb => {
            this.add.text(
                orbListX + 10,
                currentY,
                orb,
                {
                    fontSize: '16px',
                    color: '#ffffff',
                }
            ).setInteractive()
            .on('pointerdown', () => this.handleOrbSelect(orb));
            
            currentY += 30;
        });
    }

    private handleSlotClick(slotIndex: number) {
        console.log("Slot clicked:", slotIndex);
        const slot = this.currentCircuit.slots[slotIndex];
        
        // スロットに宝珠が装備されている場合は解除
        if (slot.orb) {
            slot.orb = null;
            this.scene.restart();
            return;
        }

        // 宝珠が選択されていない場合は何もしない
        if (!this.selectedOrb) {
            return;
        }

        // マナ容量のチェック
        const orbManaCost = this.getOrbManaCost(this.selectedOrb);
        const totalManaCost = this.calculateTotalManaCost() + orbManaCost;
        
        if (totalManaCost > this.status.manaCapacity) {
            // マナ容量超過の警告表示
            const warningText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 50,
                'マナ容量が不足しています',
                {
                    fontSize: '24px',
                    color: '#ff0000',
                }
            ).setOrigin(0.5);

            // 2秒後に警告を消去
            this.time.delayedCall(2000, () => {
                warningText.destroy();
            });
            return;
        }

        // 宝珠を装備
        slot.orb = this.selectedOrb;
        this.selectedOrb = null;
        this.scene.restart();
    }

    private handleCircuitSelect(circuitId: string) {
        const circuit = this.circuits.find(c => c.id === circuitId);
        if (circuit) {
            this.currentCircuit = circuit;
            this.status.currentCircuit = circuit.name;
            this.selectedOrb = null; // 回路切り替え時に選択状態をリセット
            this.scene.restart();
        }
    }

    private handleOrbSelect(orb: string) {
        // 同じ宝珠を選択した場合は選択解除
        if (this.selectedOrb === orb) {
            this.selectedOrb = null;
        } else {
            this.selectedOrb = orb;
        }
        this.scene.restart();
    }

    private calculateTotalManaCost(): number {
        return this.currentCircuit.slots.reduce((total, slot) => {
            if (!slot.orb) return total;
            return total + this.getOrbManaCost(slot.orb);
        }, 0);
    }

    private getOrbManaCost(orb: string): number {
        // 各宝珠のマナコスト（仮の実装）
        switch (orb) {
            case "マナの矢":
                return 5;
            case "ファイアボール":
                return 10;
            case "アイスシャード":
                return 8;
            default:
                return 0;
        }
    }

    private getMaxSlotX(): number {
        return Math.max(...this.currentCircuit.slots.map(slot => slot.x));
    }

    private getMaxSlotY(): number {
        return Math.max(...this.currentCircuit.slots.map(slot => slot.y));
    }
}