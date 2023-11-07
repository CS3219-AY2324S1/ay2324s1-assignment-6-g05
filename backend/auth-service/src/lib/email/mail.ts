
import { Source, Email } from "../../common/types";
const nodemailer = require("nodemailer");


class Mail {
    source: Source;
    recipient: string;
    subject: string;
    content: string;


    constructor(recipient:string, subject:string, content:string) {
        this.source = {
            user: process.env.NM_MAIL!,
            pass: process.env.NM_PASS!
        };
        this.recipient = recipient;
        this.subject = subject;
        this.content = content;
    };

    footer() {
        return (
            `<br><strong>Note:</strong> This is an auto-generated email. Please do not reply to this email.`
        );
    };

    createTransport() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: this.source,
            pool: true,
            port: 465,
            secure: true,
            connectionTimeout: 100,
        });
    };

    async send() {
        try {
            // if (!Mail.validateEmail(this.recipient)) throw new Error("Invalid email")
            console.log(this.source)
            const transporter = this.createTransport();
        
            await transporter.sendMail({
                from: this.source.user, 
                to: this.recipient,
                subject: this.subject,
                html: this.content + this.footer(),
            });
            
        }
        catch (err) {
            console.error(err);
        }
    };
};

export { Mail };