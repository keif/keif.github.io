import IconBluesky from "@/assets/icons/IconBluesky.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconMail from "@/assets/icons/IconMail.svg";
import IconMastodon from "@/assets/icons/IconMastodon.svg";
import IconPinterest from "@/assets/icons/IconPinterest.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconThreads from "@/assets/icons/IconThreads.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import { SITE } from "@/config";
import type { Props } from "astro";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/keif",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "Bluesky",
    href: "https://bsky.app/profile/keifers.bsky.social",
    linkTitle: `${SITE.title} on Bluesky`,
    icon: IconBluesky,
  },
  {    name: "Mastodon",
    href: "https://mastodon.social/@keif",
    linkTitle: `${SITE.title} on Mastodon`,
    icon: IconMastodon,
  },
  {
    name: "Threads",
    href: "https://threads.net/ikeif",
    linkTitle: `${SITE.title} on Threads`,
    icon: IconThreads,
  },
  {
    name: "X",
    href: "https://x.com/ikeif",
    linkTitle: `${SITE.title} on X`,
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/keithbaker/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "Mail",
    href: "mailto:blog@baker.is",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: IconBrandX,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: IconTelegram,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
    icon: IconPinterest,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
  {
    name: "Bluesky",
    href: "https://bsky.app/intent/compose?text=",
    linkTitle: `Share this post on Bluesky`,
    icon: IconBluesky,
  },
  {
    name: "Mastodon",
    href: "https://mastodon.social/share?text=",
    linkTitle: `Share this post on Mastodon`,
    icon: IconMastodon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/sharing/share-offsite/?url=",
    linkTitle: `Share this post on LinkedIn`,
    icon: IconLinkedin,
  },
] as const;
