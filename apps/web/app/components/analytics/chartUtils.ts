export function points(values: number[], width = 320, height = 120) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 18) - 9;
      return `${x},${y}`;
    })
    .join(" ");
}

export function areaPoints(values: number[], width = 320, height = 120) {
  return `0,${height} ${points(values, width, height)} ${width},${height}`;
}
