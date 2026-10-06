export function scorePercentage(correct: number, total: number) { return total ? Math.round(correct / total * 100) : 0 }
