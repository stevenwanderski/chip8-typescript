import { fontSet } from './fontset';
const screenWidth = 64;
const screenHeight = 32;
const screenTotal = screenWidth * screenHeight;
const screenScale = 15;
const registerCount = 16;
const stackSize = 16;
const startAddress = 0x200;
const keySize = 16;
export class Cpu {
    constructor() {
        this.pc = 0;
        this.ram = new Uint8Array(4096);
        this.vr = new Uint16Array(registerCount);
        this.ir = 0;
        this.stack = new Array(stackSize);
        this.sp = 0;
        this.dt = 0;
        this.st = 0;
        this.keys = new Uint8Array(keySize);
        this.pc = startAddress;
        for (let i = 0; i < fontSet.length; i++) {
            this.ram[i] = fontSet[i];
        }
    }
    loadRom(file) {
        for (let i = 0; i < file.length; i++) {
            this.ram[startAddress + i] = file[i];
        }
    }
    tick() {
    }
    fetch() {
        return 0;
    }
    decode(opcode) {
    }
}
