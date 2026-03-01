
"use client";

import React from "react";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <div className="space-y-2 text-sm text-foreground/80">{children}</div>
  </section>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-4">
    <h3 className="text-md font-semibold mb-2">{title}</h3>
    <div className="space-y-2 text-sm">{children}</div>
  </div>
);

const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="list-disc list-inside space-y-1 pl-4">{children}</ul>
);

export const TermsOfServiceText = () => (
  <>
    <p className="mb-4 text-sm text-muted-foreground">
      Welcome to the Venting Platform (“the Platform”, “we”, “our”, or “us”).
      By accessing or using this website and its services, you agree to comply
      with and be bound by these Terms and Conditions. If you do not agree with
      these terms, you should not use the platform.
    </p>

    <Section title="1. Purpose of the Platform">
      <p>
        The Venting Platform is designed to provide users with a safe,
        respectful, and emotionally supportive environment to express their
        thoughts and emotions, either privately or publicly. The platform
        encourages emotional expression, self-reflection, and empathetic
        interaction among users.
      </p>
      <p>
        The platform is not a medical or mental health service and does not
        provide professional advice, diagnosis, or treatment.
      </p>
    </Section>

    <Section title="2. Eligibility and User Accounts">
      <UL>
        <li>Users must comply with all applicable laws while using the platform.</li>
        <li>
          Some features require account registration using supported
          authentication methods.
        </li>
        <li>
          Users are responsible for maintaining the confidentiality of their
          account credentials.
        </li>
        <li>Anonymous or guest access may have limited features.</li>
        <li>
          We reserve the right to suspend or terminate accounts that violate
          these Terms.
        </li>
      </UL>
    </Section>

    <Section title="3. User Conduct and Community Behavior">
      <p>
        By using the platform, users agree to behave responsibly and
        respectfully.
      </p>
      <SubSection title="Expected Behavior">
        <UL>
          <li>Treat all users with empathy and respect.</li>
          <li>Communicate in a supportive and non-judgmental manner.</li>
          <li>Understand that users may be emotionally vulnerable.</li>
        </UL>
      </SubSection>
      <SubSection title="Prohibited Behavior">
        <p>Users must not:</p>
        <UL>
          <li>Harass, bully, threaten, or insult others.</li>
          <li>Post hate speech or discriminatory content.</li>
          <li>Encourage violence, self-harm, or illegal activities.</li>
          <li>Share explicit sexual content.</li>
          <li>Spam, advertise, or misuse the platform.</li>
          <li>Attempt to bypass moderation or security systems.</li>
        </UL>
        <p>
          Violations may result in content removal, account restrictions, or
          permanent suspension.
        </p>
      </SubSection>
    </Section>
    <Section title="4. Content Guidelines">
      <SubSection title="Venting Content">
        <UL>
            <li>Users may express emotions such as sadness, anger, stress, or frustration.</li>
            <li>Strong emotional language is allowed if not directed at others.</li>
            <li>Users are responsible for the content they post.</li>
        </UL>
      </SubSection>
      <SubSection title="Public Vents and Interactions">
        <UL>
            <li>Public vents are intended to foster empathy and shared understanding.</li>
            <li>Responses must be respectful, supportive, and non-dismissive.</li>
            <li>Harmful advice, judgment, or invalidation of feelings is not permitted.</li>
        </UL>
      </SubSection>
       <SubSection title="Prohibited Content">
        <p>We reserve the right to remove content that:</p>
        <UL>
            <li>Violates these Terms or community guidelines</li>
            <li>Poses a safety risk to users</li>
            <li>Is unlawful or harmful</li>
        </UL>
      </SubSection>
    </Section>

    <Section title="5. Self-Harm and Crisis Content">
        <p>Expressions of emotional distress are allowed.</p>
        <p>Content that promotes, encourages, or instructs self-harm or suicide is strictly prohibited.</p>
        <p>If content indicates severe emotional distress, we may provide supportive resources or crisis information.</p>
        <p>The platform does not replace professional mental health care. Users in crisis should seek immediate professional help.</p>
    </Section>

     <Section title="6. Privacy and Data Use">
        <p>We collect and store user data only as required to operate the platform.</p>
        <p>Users control whether their vents are private, public, or anonymous.</p>
        <p>Personal or sensitive information should not be shared publicly.</p>
        <p>All data handling is governed by our Privacy Policy.</p>
        <p>By using the platform, you consent to data processing necessary for functionality, moderation, and safety.</p>
    </Section>

    <Section title="7. Moderation and Reporting">
        <p>Users may report content or behavior that violates these Terms.</p>
        <p>Reports are reviewed using automated systems and, when necessary, human review.</p>
        <p>Moderation actions may include warnings, content removal, or account restrictions.</p>
        <p>Abuse of reporting features may result in action against the reporting user.</p>
        <p>Moderation decisions are made to protect community safety and integrity.</p>
    </Section>

    <Section title="8. Advertisements and Monetization">
        <p>Advertisements may appear in certain non-intrusive areas of the platform.</p>
        <p>Venting and emotional expression pages are kept free from disruptive ads.</p>
        <p>Ads do not use vent content for emotional or personalized targeting.</p>
        <p>Premium or ad-free options may be introduced in the future.</p>
    </Section>

    <Section title="9. Intellectual Property">
        <p>All platform content, design, and code are owned by or licensed to the platform.</p>
        <p>Users retain ownership of their own content but grant the platform a limited license to display and process it for functionality and moderation.</p>
        <p>Users must not copy, modify, or redistribute platform materials without permission.</p>
    </Section>

    <Section title="10. Limitation of Liability">
        <p>The platform is provided “as is” without warranties of any kind.</p>
        <p>We are not responsible for user-generated content or user interactions.</p>
        <p>We are not liable for emotional distress, loss, or damages arising from platform use.</p>
        <p>Users use the platform at their own discretion and responsibility.</p>
    </Section>
    
    <Section title="11. Termination of Access">
        <p>We reserve the right to:</p>
        <UL>
            <li>Suspend or terminate access for violations of these Terms</li>
            <li>Remove content that poses risk or violates guidelines</li>
            <li>Restrict features to protect the community</li>
        </UL>
        <p>Termination decisions are final.</p>
    </Section>

    <Section title="12. Changes to Terms">
        <p>These Terms may be updated periodically to reflect changes in functionality, law, or safety requirements. Continued use of the platform constitutes acceptance of updated terms.</p>
    </Section>

    <Section title="13. Contact and Support">
        <p>For questions, concerns, or reports related to these Terms, users may contact support through the platform’s help section.</p>
    </Section>

    <div className="mt-8">
        <h3 className="font-bold text-center">Final Notice</h3>
        <p className="text-center text-sm text-muted-foreground">This platform is built on trust, empathy, and safety. Users are expected to act responsibly and respectfully while using the website and its services.</p>
    </div>
  </>
);

export const PrivacyPolicyText = () => (
    <>
    <p className="mb-4 text-sm text-muted-foreground">
        This Privacy Policy explains how the Venting Platform (“we”, “our”, “us”) collects, uses, stores, and protects user information when you use our website and services. By using the platform, you agree to the practices described in this Privacy Policy.
    </p>

    <Section title="1. Information We Collect">
        <SubSection title="a) Account Information">
            <p>When you sign in using supported authentication methods, we may collect:</p>
            <UL>
                <li>User ID</li>
                <li>Display name</li>
                <li>Email address (if provided)</li>
                <li>Authentication provider (Google / Apple)</li>
                <li>Account creation date</li>
            </UL>
        </SubSection>
        <SubSection title="b) User-Generated Content">
            <p>We collect content you choose to share, including:</p>
            <UL>
                <li>Vents (private or public)</li>
                <li>Mood values associated with vents</li>
                <li>Comments on public vents</li>
                <li>Profile picture URLs</li>
                <li>Reports submitted by users</li>
            </UL>
        </SubSection>
         <SubSection title="c) Usage & Technical Data">
            <p>We may collect limited technical data such as:</p>
            <UL>
                <li>Device type and browser</li>
                <li>App usage analytics</li>
                <li>Crash and performance data</li>
            </UL>
             <p>This data is collected only to improve functionality and stability.</p>
        </SubSection>
    </Section>

    <Section title="2. How We Use Your Information">
         <p>We use collected data to:</p>
            <UL>
                <li>Provide core app functionality</li>
                <li>Store and display vents and mood history</li>
                <li>Enable public interaction where chosen</li>
                <li>Moderate content and ensure community safety</li>
                <li>Improve app performance and user experience</li>
                <li>Communicate important system or safety updates</li>
            </UL>
             <p>We do not analyze vents for advertising or emotional profiling.</p>
    </Section>

    <Section title="3. Public vs Private Content">
        <UL>
            <li>Private vents are visible only to you.</li>
            <li>Public vents are visible to other users based on your settings.</li>
            <li>Users control the visibility of their content at all times.</li>
            <li>Anonymous posting hides personal identifiers.</li>
        </UL>
    </Section>

    <Section title="4. Advertisements & Monetization">
        <UL>
            <li>Ads may be displayed in limited, non-intrusive areas.</li>
            <li>Vent content is never used for personalized or emotional ad targeting.</li>
            <li>We do not sell or rent user emotional data to advertisers.</li>
        </UL>
    </Section>

     <Section title="5. Data Storage & Security">
        <UL>
            <li>User data is securely stored using Firebase services.</li>
            <li>Access to data is restricted using authentication and security rules.</li>
            <li>We take reasonable measures to prevent unauthorized access or misuse.</li>
            <li>Despite safeguards, no system is completely secure, and users should use the platform responsibly.</li>
        </UL>
    </Section>

     <Section title="6. Moderation & Safety">
        <UL>
            <li>Content may be reviewed by automated systems and moderators to enforce safety rules.</li>
            <li>Reports submitted by users are used only for moderation purposes.</li>
            <li>Moderation actions focus on safety, not punishment.</li>
        </UL>
    </Section>

    <Section title="7. Data Sharing">
        <p>We do not share personal data with third parties except:</p>
        <UL>
            <li>When required by law</li>
            <li>To comply with legal processes</li>
            <li>To protect the safety of users or the platform</li>
        </UL>
    </Section>

    <Section title="8. User Rights & Control">
        <p>Users have the right to:</p>
        <UL>
            <li>Edit or delete their content</li>
            <li>Delete their account</li>
            <li>Request data removal</li>
            <li>Control privacy and visibility settings</li>
        </UL>
        <p>Some data may remain temporarily in backups for security or legal reasons.</p>
    </Section>
    
    <Section title="9. Children’s Privacy">
        <p>This platform is not intended for children under the age required by applicable laws. We do not knowingly collect data from minors.</p>
    </Section>

    <Section title="10. Changes to This Privacy Policy">
        <p>This Privacy Policy may be updated from time to time. Continued use of the platform after updates constitutes acceptance of the revised policy.</p>
    </Section>

     <Section title="11. Contact Information">
        <p>For privacy-related questions or concerns, users may contact support through the platform.</p>
    </Section>

    <div className="mt-8">
        <h3 className="font-bold text-center">Final Note on Trust</h3>
        <p className="text-center text-sm text-muted-foreground">This platform is built to respect emotional privacy and user dignity. Your data belongs to you, and emotional expression is treated with care and responsibility.</p>
    </div>
    </>
);
