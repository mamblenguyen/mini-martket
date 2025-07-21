export function generateVietQRImageUrl({
  bankId,
  accountNumber,
  accountName,
  amount,
  addInfo,
}: {
  accountName: string;
  accountNumber: string;
  bankId: string;
  amount: number;
  addInfo?: string;
}): string {
  const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png`;

  const params = new URLSearchParams({
    amount: amount.toString(),
    accountName,
  });

  if (addInfo && addInfo.trim() !== '') {
    params.append('addInfo', addInfo.trim());
  }

  return `${baseUrl}?${params.toString()}`;
}
