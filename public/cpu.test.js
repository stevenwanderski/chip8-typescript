import * as fs from "fs";
import * as path from "path";
import { Cpu } from "./cpu";
import { fontSet } from './fontset';
describe('Cpu', () => {
    let cpu;
    beforeEach(() => {
        cpu = new Cpu();
        const file = fs.readFileSync(path.join(__dirname, "../roms/ibm-logo.ch8"));
        cpu.loadRom(file);
    });
    it('loads the fontSet into ram', () => {
        expect(cpu.ram[0]).toEqual(fontSet[0]);
        expect(cpu.ram[1]).toEqual(fontSet[1]);
        expect(cpu.ram[2]).toEqual(fontSet[2]);
        expect(cpu.ram[3]).toEqual(fontSet[3]);
    });
    describe('#loadRom', () => {
        it('loads a file at the start address', () => {
            expect(cpu.ram[0x200]).toEqual(0x00);
            expect(cpu.ram[0x201]).toEqual(0xE0);
            expect(cpu.ram[0x202]).toEqual(0xA2);
        });
    });
    describe('#fetch', () => {
        it('increases the pc by 2', () => {
            cpu.fetch();
            expect(cpu.pc).toEqual(0x202);
        });
        it('returns the next opcode', () => {
            const opcode = cpu.fetch();
            expect(opcode).toEqual(0x00E0);
        });
    });
    describe('#parseOpcode', () => {
        it('parses 1xyn', () => {
            const result = cpu.parseOpcode(0x1234);
            expect(result.main).toEqual(1);
            expect(result.x).toEqual(2);
            expect(result.y).toEqual(3);
            expect(result.n).toEqual(4);
        });
        it('parses 8nnn', () => {
            const result = cpu.parseOpcode(0x8234);
            expect(result.main).toEqual(8);
            expect(result.nnn).toEqual(0x234);
        });
        it('parses 8xnn', () => {
            const result = cpu.parseOpcode(0x8234);
            expect(result.main).toEqual(8);
            expect(result.x).toEqual(2);
            expect(result.nn).toEqual(0x34);
        });
    });
    describe('#decode', () => {
        describe('00E0', () => {
            it('clears the screen', () => {
                cpu.screen[0] = 1;
                cpu.screen[1] = 1;
                cpu.screen[2] = 1;
                cpu.decode(0x00E0);
                expect(cpu.screen[0]).toEqual(0);
                expect(cpu.screen[1]).toEqual(0);
                expect(cpu.screen[2]).toEqual(0);
                expect(cpu.screen[3]).toEqual(0);
            });
        });
        describe('1nnn', () => {
            it('sets the pc to nnn', () => {
                cpu.pc = 0x200;
                cpu.decode(0x1220);
                expect(cpu.pc).toEqual(0x220);
            });
        });
        describe('6xnn', () => {
            it('sets vr[x] to nn', () => {
                cpu.vr[2] = 0x1;
                cpu.decode(0x6202);
                expect(cpu.vr[2]).toEqual(0x2);
            });
        });
        describe('7xnn', () => {
            it('sets vr[x] to vr[x] + nn', () => {
                cpu.vr[2] = 0x1;
                cpu.decode(0x7202);
                expect(cpu.vr[2]).toEqual(0x3);
            });
        });
        describe('Annn', () => {
            it('sets ir to nnn', () => {
                cpu.ir = 0x1;
                cpu.decode(0xA202);
                expect(cpu.ir).toEqual(0x202);
            });
        });
        describe('Dxyn', () => {
            it('sets ir to nnn', () => {
                cpu.ir = 0x202;
                cpu.ram[0x202] = 0xA1;
                cpu.ram[0x203] = 0xB2;
                cpu.ram[0x204] = 0xC3;
                cpu.vr[1] = 1;
                cpu.vr[2] = 0;
                cpu.decode(0xD123);
                expect(cpu.screen[0]).toEqual(0);
                expect(cpu.screen[1]).toEqual(1);
                expect(cpu.screen[2]).toEqual(0);
                expect(cpu.screen[3]).toEqual(1);
                expect(cpu.screen[4]).toEqual(0);
                expect(cpu.screen[5]).toEqual(0);
                expect(cpu.screen[6]).toEqual(0);
                expect(cpu.screen[7]).toEqual(0);
                expect(cpu.screen[8]).toEqual(1);
            });
        });
    });
});
