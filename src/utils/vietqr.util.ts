export function generateVietQRImageUrl({
  bankId,
  accountNumber,
  accountName,
  amount,
  orderCode,
}: {
  bankId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  orderCode: string;
}): string {
  const encodedInfo = encodeURIComponent(orderCode);
  const encodedName = encodeURIComponent(accountName);

  return `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;
}
