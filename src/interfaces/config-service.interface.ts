import { IEnvironment } from "./environment.interface";

export interface IConfigService {
  get<T>(name: keyof IEnvironment): T;
}
