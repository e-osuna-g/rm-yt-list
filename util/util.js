export function timeStringToSeconds(timeString) {
  if (typeof timeString !== "string") return 0;
  const arr = timeString.split(":").reverse();
  let seconds = 0;

  for (let i = 0; i < arr.length; i++) {
    const multiplier = 60 ** i; //1 in index 0.
    seconds += Number(arr[i]) * multiplier;
  }
  return seconds;
}
