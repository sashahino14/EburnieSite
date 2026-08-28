export interface Auth {
  preferred_username: string;
  picture: string;
  name: string;
  html_url?: string;
  isLocalUse?: boolean;
  authenticated?: boolean;
}

export interface HtmlHistory {
  html: string;
  createdAt: Date;
  prompt: string;
}
