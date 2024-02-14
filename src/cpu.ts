import { fontSet } from './fontset';

const SCREEN_WIDTH = 64;
const SCREEN_HEIGHT = 32;
const SCREEN_TOTAL = SCREEN_WIDTH * SCREEN_HEIGHT;
const SCREEN_SCALE = 15;
const REGISTER_COUNT = 16;
const STACK_SIZE = 16;
const START_ADDRESS = 0x200;
const KEY_SIZE = 16;

interface Opcode {
  main: number;
  x: number;
  y: number;
  n: number;
  nn: number;
  nnn: number;
}

export class Cpu {
  pc = 0;
  ram = new Uint8Array(4096);
  vr = new Uint16Array(REGISTER_COUNT);
  ir = 0;
  stack = new Uint16Array(STACK_SIZE);
  sp = 0;
  dt = 0;
  st = 0;
  keys = new Uint8Array(KEY_SIZE)
  screen = new Uint8Array(SCREEN_TOTAL)

  constructor() {
    this.pc = START_ADDRESS;

    for (let i = 0; i < fontSet.length; i++) {
      this.ram[i] = fontSet[i];
    }
  }

  loadRom(file: Buffer) {
    for (let i = 0; i < file.length; i++) {
      this.ram[START_ADDRESS + i] = file[i];
    }
  }

  tick(): void {

  }

  fetch(): number {
    const byte1 = this.ram[this.pc];
    const byte2 = this.ram[this.pc + 1];
    const opcode = (byte1 >> 8) | byte2;

    this.pc += 2;

    return opcode;
  }

  decode(opcode: number): void {
    const o = this.parseOpcode(opcode);

    // 00E0 (clear screen)
    // 1NNN (jump)
    // 6XNN (set register VX)
    // 7XNN (add value to register VX)
    // ANNN (set index register I)
    // DXYN (display/draw)

    switch (o.main) {
      case 0:
        switch (o.nn) {
          case 0xE0:
            for (let i = 0; i < this.screen.length; i++) {
              this.screen[i] = 0;
            }
            break;
        }

      case 0x1:
        this.pc = o.nnn;
        break;

      case 0x6:
        this.vr[o.x] = o.nn;
        break;

      case 0x7:
        this.vr[o.x] += o.nn;
        break;

      case 0xA:
        this.ir = o.nnn;
        break;

      case 0xD:
        for (let i = 0; i < o.n; i++) {
          const byte = this.ram[this.ir + i];

          for (let j = 0; j < 8; j++) {
            if ((byte & (0b10000000 >> j)) != 0) {
              const xPosition = (this.vr[o.x]+j) % SCREEN_WIDTH
              const yPosition = (this.vr[o.y]+i) % SCREEN_HEIGHT

              const screenIndex = (yPosition * SCREEN_WIDTH) + xPosition;

              if (this.screen[screenIndex] == 1) {
                this.vr[0xF] = 1
              } else {
                this.vr[0xF] = 0
              }

              this.screen[screenIndex] ^= 1;
            }
          }
        }

        break;

      default:
        console.log(`Unhandled opcode: ${opcode}`);
    }
  }

  parseOpcode(opcode: number): Opcode {
    return {
      main: (opcode & 0xF000) >> 12,
      x: (opcode & 0x0F00) >> 8,
      y: (opcode & 0x00F0) >> 4,
      n: opcode & 0x000F,
      nn: opcode & 0x00FF,
      nnn: opcode & 0x0FFF,
    }
  }
}