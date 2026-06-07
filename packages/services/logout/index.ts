import { type LogoutOutput } from "./model";

class LogoutService {
  public async logout(): Promise<LogoutOutput> {
    return { success: true };
  }
}

export default LogoutService;
