import * as sgMail from "@sendgrid/mail";
import { MovementData, EmailConfig, EmailAttachment } from "../types";

/**
 * Servicio de email usando SendGrid
 */
export class EmailService {
  private fromEmail: string;

  constructor() {
    // Configurar SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY environment variable is required");
    }
    
    sgMail.setApiKey(apiKey);
    this.fromEmail = process.env.FROM_EMAIL || "noreply@boletera.com";
  }

  /**
   * Enviar email con tickets adjuntos
   */
  public async sendTicketEmail(
    movementData: MovementData,
    pdfUrl: string,
    ticketCount: number
  ): Promise<void> {
    try {
      if (!movementData.buyer_email) {
        throw new Error("No buyer email found for movement");
      }

      // Descargar el PDF para adjuntarlo
      const pdfResponse = await fetch(pdfUrl);
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

      const attachment: EmailAttachment = {
        filename: `boletos-${movementData.id}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
        content_id: "tickets",
        content: pdfBase64,
      };

      const emailConfig: EmailConfig = {
        to: movementData.buyer_email,
        from: this.fromEmail,
        subject: "🎫 Tus boletos han sido confirmados",
        html: this.getEmailTemplate(movementData, ticketCount, pdfUrl),
        attachments: [attachment],
      };

      await sgMail.send(emailConfig);
      console.log(`Email sent successfully to ${movementData.buyer_email}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmación de pago
   */
  public async sendPaymentConfirmationEmail(
    email: string,
    movementData: MovementData
  ): Promise<void> {
    try {
      const emailConfig: EmailConfig = {
        to: email,
        from: this.fromEmail,
        subject: "✅ Pago confirmado - Procesando tus boletos",
        html: this.getPaymentConfirmationTemplate(movementData),
      };

      await sgMail.send(emailConfig);
      console.log(`Payment confirmation email sent to ${email}`);
    } catch (error) {
      console.error("Error sending payment confirmation email:", error);
      throw error;
    }
  }

  /**
   * Template HTML para email de tickets
   */
  private getEmailTemplate(
    movementData: MovementData,
    ticketCount: number,
    pdfUrl: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">🎫 ¡Tus boletos están listos!</h1>
        
        <p>Hola ${movementData.buyer_name || "Usuario"},</p>
        
        <p>Tu compra ha sido confirmada exitosamente. Aquí tienes los detalles:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Detalles de la compra:</h3>
          <p><strong>ID de compra:</strong> ${movementData.id}</p>
          <p><strong>Número de boletos:</strong> ${ticketCount}</p>
          <p><strong>Total pagado:</strong> $${movementData.total}</p>
          <p><strong>Método de pago:</strong> ${movementData.tipo_pago}</p>
        </div>
        
        <p>Tus boletos están adjuntos en formato PDF. También puedes descargarlos desde el siguiente enlace:</p>
        
        <a href="${pdfUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          📥 Descargar Boletos
        </a>
        
        <p><small>Este enlace expira en 7 días por seguridad.</small></p>
        
        <hr style="margin: 30px 0;">
        
        <p><strong>Instrucciones importantes:</strong></p>
        <ul>
          <li>Presenta tus boletos en formato digital o impreso el día del evento</li>
          <li>Cada boleto tiene un código QR único para validación</li>
          <li>Llega con tiempo suficiente para el acceso al evento</li>
        </ul>
        
        <p>¡Esperamos que disfrutes el evento!</p>
        
        <p style="color: #666; font-size: 12px;">
          Este email fue enviado automáticamente. No respondas a este mensaje.
        </p>
      </div>
    `;
  }

  /**
   * Template HTML para confirmación de pago
   */
  private getPaymentConfirmationTemplate(movementData: MovementData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #28a745;">✅ ¡Pago confirmado!</h1>
        
        <p>Hola ${movementData.buyer_name || "Usuario"},</p>
        
        <p>Hemos recibido tu pago exitosamente y estamos procesando tus boletos.</p>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #155724; margin: 0 0 10px 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>ID de compra:</strong> ${movementData.id}</p>
          <p style="margin: 5px 0;"><strong>Monto:</strong> $${movementData.total}</p>
          <p style="margin: 5px 0;"><strong>Método de pago:</strong> ${movementData.tipo_pago}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> Confirmado</p>
        </div>
        
        <p><strong>¿Qué sigue?</strong></p>
        <ul>
          <li>Generaremos tus boletos automáticamente</li>
          <li>Recibirás otro email con los boletos en formato PDF</li>
          <li>Este proceso puede tomar hasta 5 minutos</li>
        </ul>
        
        <p>Gracias por tu compra. Te contactaremos pronto con tus boletos.</p>
        
        <p style="color: #666; font-size: 12px;">
          Este email fue enviado automáticamente. No respondas a este mensaje.
        </p>
      </div>
    `;
  }
} 