const nodemailer = require("nodemailer");

const sendEmail =async(options)=>
{
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP.USER,
          pass: process.env.SMTP.PASS
        }
      });
    const mailOptions={
    
        from:process.env.SMTP.USER,
        to: options.email,
        subject:options.subject,
        text: options.message
    
    }
    await transport.sendMail(mailOptions);
}

module.exports= sendEmail;



