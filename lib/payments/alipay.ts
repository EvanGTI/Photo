import { AlipaySdk } from "alipay-sdk"

let _sdk: AlipaySdk | null = null

function getAlipaySDK() {
  if (!_sdk) {
    _sdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
      gateway: process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do",
      signType: "RSA2",
      charset: "utf-8",
    })
  }
  return _sdk
}

/** PC 网页支付（返回跳转表单 HTML） */
export async function createAlipayPagePay({
  outTradeNo,
  subject,
  totalAmount,
  returnUrl,
  notifyUrl,
}: {
  outTradeNo: string
  subject: string
  totalAmount: string // 字符串，如 "99.00"
  returnUrl: string
  notifyUrl: string
}) {
  const sdk = getAlipaySDK()
  const formData = await sdk.pageExec("alipay.trade.page.pay", {
    method: "GET",
    bizContent: {
      out_trade_no: outTradeNo,
      product_code: "FAST_INSTANT_TRADE_PAY",
      total_amount: totalAmount,
      subject,
    },
    returnUrl,
    notifyUrl,
  })
  return formData // 返回支付宝 H5 跳转 URL
}

/** H5 手机端支付 */
export async function createAlipayWapPay({
  outTradeNo,
  subject,
  totalAmount,
  returnUrl,
  notifyUrl,
}: {
  outTradeNo: string
  subject: string
  totalAmount: string
  returnUrl: string
  notifyUrl: string
}) {
  const sdk = getAlipaySDK()
  const result = await sdk.pageExec("alipay.trade.wap.pay", {
    method: "GET",
    bizContent: {
      out_trade_no: outTradeNo,
      product_code: "QUICK_WAP_WAY",
      total_amount: totalAmount,
      subject,
    },
    returnUrl,
    notifyUrl,
  })
  return result
}

/** 查询订单状态 */
export async function queryAlipayOrder(outTradeNo: string) {
  const sdk = getAlipaySDK()
  const result = await sdk.exec("alipay.trade.query", {
    bizContent: { out_trade_no: outTradeNo },
  })
  return result
}

/** 验证异步通知签名 */
export function verifyAlipayNotify(params: Record<string, string>): boolean {
  const sdk = getAlipaySDK()
  try {
    return sdk.checkNotifySign(params)
  } catch {
    return false
  }
}
