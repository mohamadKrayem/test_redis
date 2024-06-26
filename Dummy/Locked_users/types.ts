export type User = {
  username: string;
  isAdmin: boolean;
  entity: number;
  id: string | number;
  lockedSince: string;
  entity_name: string;
  numberOfAttempts: number;
}
