/**
 * Build a URL with UTM parameters for tracking in GoatCounter (or any analytics).
 *
 * @param baseUrl - The clean URL (e.g. "https://yourblog.com/post-title")
 * @param source - The referrer/source (e.g. "github", "mastodon", "newsletter")
 * @param medium - The channel (e.g. "social", "email", "referral")
 * @param campaign - The campaign name (e.g. "blog_launch", "spring_update")
 * @param content - (Optional) Further differentiate links (e.g. "footer", "sidebar")
 * @returns A full URL with UTM params
 */
export function buildUTMUrl(
	baseUrl: string,
	source: string,
	medium: string,
	campaign: string,
	content?: string
): string {
	const url = new URL(baseUrl);
	url.searchParams.set("utm_source", source);
	url.searchParams.set("utm_medium", medium);
	url.searchParams.set("utm_campaign", campaign);
	if (content) {
		url.searchParams.set("utm_content", content);
	}
	return url.toString();
}