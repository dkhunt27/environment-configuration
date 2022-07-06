export interface IInstruction {
  execute(instruction: string): Promise<string>;
}
