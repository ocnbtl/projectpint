import { SiteShell } from "../../../components/SiteShell";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <section className="legal-figma-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
        </div>
      </section>

      <div className="container legal-figma-body">
        <article className="legal-prose">
          <p>
            <strong>Last updated:</strong> March 1, 2026
          </p>
          <p>
            Diyesu Decor respects your privacy and is committed to protecting your personal information. This Privacy
            Policy explains how we collect, use, and share information when you visit our website.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We may collect information you provide directly, such as your email address when you sign up for our
            newsletter or use the Plant Picker tool. Signup data may be processed through Klaviyo and stored in the live
            command-center workflow for operations management.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            We use your information to send requested email content, improve recommendations, analyze content
            performance, and communicate about products or updates.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies and similar technologies for analytics purposes. You can control cookie preferences through
            your browser settings.
          </p>

          <h2>Contact</h2>
          <p>
            We do not sell personal information. You can unsubscribe at any time from email messages. For questions,
            contact <a href="mailto:support@diyesudecor.com">support@diyesudecor.com</a>.
          </p>
        </article>
      </div>
    </SiteShell>
  );
}
