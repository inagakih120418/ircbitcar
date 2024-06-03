//% weight=0 color=#3333df icon="\uf2db" block="IRC bit Car"
namespace robots {
    let sensorValues: number[] = []; // IRセンサーを規定数取得-格納する配列
    let averageValue = 0; // 配列sensorValuesの平均値を格納する変数
    let lineValue = 0; // LINEセンサーの値を格納する変数

    let trig = DigitalPin.P8; // 超音波センサーのトリガーピン
    let echo = DigitalPin.P2; // 超音波センサーのエコーピン

    let maxCmDistance = 500 // 超音波センサーで取得できる最大距離

    /**
     * IRセンサーのアナログ値を500回分取得し、平均を求める関数
     * @returns 平均IRセンサー値（赤外線の近さを数値化：数値が高ければ近い。）
     */
    //% block="IRセンサー平均値"
    export function getSensorVar(): number {
        sensorValues = [];
        for (let i: number = 0; i < 500; i++) {
            let analogValue = pins.analogReadPin(AnalogPin.P0);
            // 読み取った値を配列に追加
            sensorValues.push(analogValue);
        }
        // 500回のセンサー値を取得したら平均値を計算
        let sum = sensorValues.reduce((a, b) => a + b, 0);
        averageValue = sum / sensorValues.length;
        // 平均値をシリアルモニターに表示
        serial.writeValue("Average Value", averageValue);

        return 1023 - averageValue;
    }

    /**
     * LINEセンサーの値を取得する関数
     * @returns LINEセンサー値（白色：数値が低い、黒色：数値が高い）
     */
    //% block="Lineセンサー"
    export function getLineVer(): number {
        // Lineセンサーのアナログ値を読み取る
        lineValue = pins.analogReadPin(AnalogPin.P1);
        // 値をシリアルモニターに表示
        serial.writeValue("Line Value", lineValue);

        return lineValue;
    }

    /**
     * 超音波センサを使用して距離を測定し、その結果をセンチメートル単位で返します。
     * @returns 距離（センチメートル単位）
     */
    //% block="超音波センサー"
    export function getEchoVer(): number {
        // トリガーピンのプルモードを設定
        pins.setPull(trig, PinPullMode.PullNone);

        // トリガーピンをLOWに設定
        pins.digitalWritePin(trig, 0);
        // 2マイクロ秒待機
        control.waitMicros(2);

        // トリガーピンをHIGHに設定して超音波パルスを送信
        pins.digitalWritePin(trig, 1);
        // 10マイクロ秒待機
        control.waitMicros(10);

        // トリガーピンを再びLOWに設定
        pins.digitalWritePin(trig, 0);

        // エコーピンのパルス幅を測定（最大測定距離に基づくタイムアウト付き）
        let d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);
        // 測定結果をセンチメートル単位でシリアル出力
        serial.writeValue("Echo Value", Math.idiv(d, 58));
        // 測定結果をセンチメートル単位で返す
        return Math.idiv(d, 58);
    }

    /**
     * 左右のモーターを制御します。
     * @param right 右モーターの制御値（-1023から1023）
     * @param left 左モーターの制御値（-1023から1023）
     */
    //% block="右タイヤを $right 、左タイヤを $left の速さで回す"
    //% right.min=-1023 right.max=1023 left.min=-1023 left.max=1023
    export function inputMoter(right: number, left: number): void {
        if (right < -1023) {
            right = -1023;
        } else if (right > 1023) {
            right = 1023;
        }

        if (left < -1023) {
            left = -1023;
        } else if (left > 1023) {
            left = 1023;
        }

        if (right < 0) {
            pins.digitalWritePin(DigitalPin.P14, 0);
            pins.digitalWritePin(DigitalPin.P15, 1);
        } else if (right == 0) {
            pins.digitalWritePin(DigitalPin.P14, 1);
            pins.digitalWritePin(DigitalPin.P15, 1);
        } else if (right > 0) {
            pins.digitalWritePin(DigitalPin.P14, 1);
            pins.digitalWritePin(DigitalPin.P15, 0);
        }

        if (left < 0) {
            pins.digitalWritePin(DigitalPin.P12, 1);
            pins.digitalWritePin(DigitalPin.P13, 0);
        } else if (left == 0) {
            pins.digitalWritePin(DigitalPin.P12, 0);
            pins.digitalWritePin(DigitalPin.P13, 0);
        } else if (left > 0) {
            pins.digitalWritePin(DigitalPin.P12, 0);
            pins.digitalWritePin(DigitalPin.P13, 1);
        }

        pins.analogWritePin(AnalogPin.P16, Math.abs(right));
        pins.analogWritePin(AnalogPin.P9, Math.abs(left));
    }
}
