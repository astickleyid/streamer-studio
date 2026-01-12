export interface TwitchChannel {
  name: string;
  game: string;
  viewers: string;
  thumbnail: string;
  isTwitch: boolean;
  isBridged?: boolean;
  followers?: string;
  uptime?: string;
}

export const getTopTwitchStreams = (): TwitchChannel[] => {
  return [
    { name: 'shroud', game: 'VALORANT', viewers: '34.2k', thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_shroud-440x248.jpg', isTwitch: true, isBridged: true, followers: '10.9M', uptime: '4h 12m' },
    { name: 'ninja', game: 'Fortnite', viewers: '12.5k', thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_ninja-440x248.jpg', isTwitch: true, isBridged: false, followers: '19M', uptime: '2h 45m' },
    { name: 'esl_csgo', game: 'Counter-Strike', viewers: '85k', thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_esl_csgo-440x248.jpg', isTwitch: true, isBridged: true, followers: '6.5M', uptime: '12h 05m' },
    { name: 'gaules', game: 'Counter-Strike', viewers: '56.1k', thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_gaules-440x248.jpg', isTwitch: true, isBridged: false, followers: '4M', uptime: '24h 00m' },
    { name: 'pokimane', game: 'Just Chatting', viewers: '18.9k', thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_pokimane-440x248.jpg', isTwitch: true, isBridged: true, followers: '9.4M', uptime: '1h 30m' },
  ];
};

export const getParentDomains = (customParents: string[] = []) => {
  const parents = new Set<string>();
  parents.add(window.location.hostname);
  const devHosts = [
    'localhost', 'stackblitz.io', 'webcontainer.io', 'google.com',
    'aistudio.google.com', 'project-root.webcontainer.io', 'codesandbox.io'
  ];
  devHosts.forEach(host => parents.add(host));
  customParents.forEach(host => parents.add(host.trim()));
  try {
    if (document.referrer) {
      const referrerHost = new URL(document.referrer).hostname;
      if (referrerHost) parents.add(referrerHost);
    }
  } catch (e) {}
  return Array.from(parents)
    .filter(p => p && p.length > 0)
    .map(p => `parent=${p.split(':')[0]}`)
    .join('&');
};

export const getTwitchEmbedUrl = (channelName: string, customParents: string[] = []) => {
  const parentParams = getParentDomains(customParents);
  return `https://player.twitch.tv/?channel=${channelName}&${parentParams}&muted=false&autoplay=true&referrer=${encodeURIComponent(window.location.origin)}`;
};

export const getTwitchChatUrl = (channelName: string, customParents: string[] = []) => {
  const parentParams = getParentDomains(customParents);
  return `https://www.twitch.tv/embed/${channelName}/chat?${parentParams}&darkpopout=true`;
};
