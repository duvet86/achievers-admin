import type { Mentor } from "./Mentor";

export interface IMentorRepository {
  findOneByIdAsync(id: number): Promise<Mentor | null>;
  saveAsync(entity: Mentor): Promise<void>;
}
