const nodemailer = require("nodemailer");

const sendEmail =async(options)=>
{
    const transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "a5b71802fb330a",
          pass: "015c1649105f4d"
        }
      });
    const mailOptions={
    
        from:"a5b71802fb330a",
        to: options.email,
        subject:options.subject,
        text: options.message
    
    }
    await transport.sendMail(mailOptions);
}

module.exports= sendEmail;



