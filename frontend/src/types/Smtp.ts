export interface SmtpConfig {
    from_name: string;
    from_email: string;
    smtp_host: string;
    smtp_port: number | '';
    smtp_user: string;
    smtp_password?: string;
    is_configured: boolean;
}
