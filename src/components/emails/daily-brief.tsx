import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import type { DailyBriefProps } from "@/types/email";

export default function DailyBrief({
  userName,
  date,
  topics,
  globalEvents,
  unsubscribeUrl,
  manageTopicsUrl,
}: DailyBriefProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

  const topicCount = topics.length;
  const previewText = `Your daily brief covering ${topicCount} topic${topicCount !== 1 ? "s" : ""}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>DailyBrief</Heading>
            <Text style={dateText}>{formattedDate}</Text>
          </Section>

          {/* Greeting */}
          <Section style={greetingSection}>
            <Heading style={greeting}>Good morning, {userName}</Heading>
            <Text style={summary}>
              Today&apos;s brief covers {topicCount} topic{topicCount !== 1 ? "s" : ""}.
              Here&apos;s what you need to know:
            </Text>
          </Section>

          {/* Topics */}
          {topics.map((topic, topicIndex) => (
            <Section key={topicIndex} style={topicSection}>
              <Heading style={topicHeading}>
                {topic.name}
                <span style={categoryBadge}>{topic.category}</span>
              </Heading>

              {topic.articles.map((article, articleIndex) => (
                <div key={articleIndex} style={articleContainer}>
                  {article.imageUrl && (
                    <Img
                      src={article.imageUrl}
                      alt={article.title}
                      style={articleImage}
                      width="600"
                      height="300"
                    />
                  )}
                  <Heading style={articleTitle}>
                    <Link href={article.sourceUrl} style={articleLink}>
                      {article.title}
                    </Link>
                  </Heading>
                  <Text style={articleSummary}>{article.summary}</Text>
                  <Text style={articleMeta}>
                    {article.sourceName} •{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(article.publishedAt))}
                  </Text>
                  {articleIndex < topic.articles.length - 1 && (
                    <Hr style={articleDivider} />
                  )}
                </div>
              ))}

              {topicIndex < topics.length - 1 && <Hr style={topicDivider} />}
            </Section>
          ))}

          {/* Global Events */}
          {globalEvents && globalEvents.length > 0 && (
            <Section style={globalEventsSection}>
              <Heading style={globalEventsHeading}>
                📅 Today&apos;s Events
              </Heading>
              {globalEvents.map((event, index) => (
                <div key={index} style={eventContainer}>
                  <Heading style={eventTitle}>{event.title}</Heading>
                  <Text style={eventDescription}>{event.description}</Text>
                  <Text style={eventCategory}>{event.category}</Text>
                </div>
              ))}
            </Section>
          )}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={manageTopicsUrl} style={footerLink}>
                Manage your topics
              </Link>
              {" • "}
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={brandingText}>
              Powered by <strong>DailyBrief</strong> — Your personalized news digest
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 40px",
  borderBottom: "1px solid #e6ebf1",
};

const logo = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const dateText = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0",
};

const greetingSection = {
  padding: "32px 40px 24px",
};

const greeting = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const summary = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const topicSection = {
  padding: "0 40px",
  marginBottom: "16px",
};

const topicHeading = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 20px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const categoryBadge = {
  display: "inline-block",
  backgroundColor: "#e0e7ff",
  color: "#4f46e5",
  fontSize: "12px",
  fontWeight: "500",
  padding: "4px 12px",
  borderRadius: "12px",
  textTransform: "capitalize" as const,
  marginLeft: "12px",
};

const articleContainer = {
  marginBottom: "24px",
};

const articleImage = {
  borderRadius: "8px",
  marginBottom: "16px",
  width: "100%",
  height: "auto",
  objectFit: "cover" as const,
};

const articleTitle = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
  lineHeight: "26px",
};

const articleLink = {
  color: "#1a1a1a",
  textDecoration: "none",
};

const articleSummary = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 8px",
};

const articleMeta = {
  color: "#9ca3af",
  fontSize: "13px",
  margin: "0",
};

const articleDivider = {
  borderColor: "#f3f4f6",
  margin: "20px 0",
};

const topicDivider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const globalEventsSection = {
  padding: "24px 40px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  margin: "32px 40px",
};

const globalEventsHeading = {
  color: "#92400e",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const eventContainer = {
  marginBottom: "16px",
};

const eventTitle = {
  color: "#78350f",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const eventDescription = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 4px",
};

const eventCategory = {
  color: "#b45309",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0",
};

const footer = {
  padding: "32px 40px",
  borderTop: "1px solid #e6ebf1",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "0 0 12px",
};

const footerLink = {
  color: "#4f46e5",
  textDecoration: "underline",
};

const brandingText = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};
