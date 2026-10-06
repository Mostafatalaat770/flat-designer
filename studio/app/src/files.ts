export const download = (name: string, data: Blob | string) => {
  const url = URL.createObjectURL(
    typeof data === "string"
      ? new Blob([data], { type: "application/json" })
      : data,
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
