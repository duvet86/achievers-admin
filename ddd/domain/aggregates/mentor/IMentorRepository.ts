import type { Mentor } from "./Mentor";

export interface IMentorRepository {
  findByIdAsync(id: number): Promise<Mentor>;
  saveAsync(entity: Mentor): Promise<void>;
}
