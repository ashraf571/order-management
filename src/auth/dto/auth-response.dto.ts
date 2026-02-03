export class AuthResponseDto {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
