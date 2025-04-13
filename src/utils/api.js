export const fetchHorrorGames = async () => {
  try {
    const response = await fetch('/api/horror-games');
    if (!response.ok) {
      throw new Error('Failed to fetch horror games');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching horror games:', error);
    return [];
  }
}; 