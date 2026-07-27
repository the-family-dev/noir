export function getRandomEmoji(): string {
  const emojis = [
    "😀", "😍", "🚀", "🔥", "🎉", "🌟", "✨", "💡",
    "👍", "👏", "🎉", "🌈", "🎈", "🎊", "💥", "⭐"
  ];
  const randomIndex = Math.floor(Math.random() * emojis.length);
  return emojis[randomIndex];
}
