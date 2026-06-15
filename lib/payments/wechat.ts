import * as fs from "fs"

// 动态加载 WechatPay 避免 TS 类型冲突
function getWechatClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const WechatPay = require("wechatpay-node-v3")
  const Pay: any = WechatPay.default || WechatPay.Pay || WechatPay

  const privateKey = fs.readFileSync(
    process.env.WECHAT_PRIVATE_KEY_PATH || "./certs/apiclient_key.pem"
  )
  // publicKey 微信平台证书（可选，v3 API 在部分场景需要）
  let publicKey: Buffer | undefined
  const pubKeyPath = process.env.WECHAT_PUBLIC_KEY_PATH
  if (pubKeyPath && fs.existsSync(pubKeyPath)) {
    publicKey = fs.readFileSync(pubKeyPath)
  }

  return new Pay({
    appid: process.env.WECHAT_APP_ID!,
    mchid: process.env.WECHAT_MCH_ID!,
    serial_no: process.env.WECHAT_CERT_SERIAL_NO!,
    publicKey: publicKey || Buffer.alloc(0),
    privateKey,
    key: process.env.WECHAT_API_V3_KEY!,
  })
}

/** Native 扫码支付（返回二维码 URL） */
export async function createWechatNativePay({
  outTradeNo,
  description,
  totalFen,
  notifyUrl,
}: {
  outTradeNo: string
  description: string
  totalFen: number
  notifyUrl: string
}): Promise<{ code_url: string }> {
  const client = getWechatClient()
  const result = await client.transactions_native({
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    amount: {
      total: totalFen,
      currency: "CNY",
    },
  })
  return result as { code_url: string }
}

/** H5 支付（手机浏览器） */
export async function createWechatH5Pay({
  outTradeNo,
  description,
  totalFen,
  notifyUrl,
  clientIp,
}: {
  outTradeNo: string
  description: string
  totalFen: number
  notifyUrl: string
  clientIp: string
}): Promise<{ h5_url: string }> {
  const client = getWechatClient()
  const result = await client.transactions_h5({
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    amount: {
      total: totalFen,
      currency: "CNY",
    },
    scene_info: {
      payer_client_ip: clientIp,
      h5_info: { type: "Wap", app_name: "Photography Store" },
    },
  })
  return result as { h5_url: string }
}

/** 查询订单 */
export async function queryWechatOrder(outTradeNo: string) {
  const client = getWechatClient()
  return client.query({ out_trade_no: outTradeNo })
}

/** 验证回调通知签名 */
export async function verifyWechatNotify(
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  try {
    const client = getWechatClient()
    const result = await client.verifySign?.({ headers, body })
    return !!result
  } catch {
    return false
  }
}

/** 解密微信支付回调数据 */
export function decryptWechatResource(
  ciphertext: string,
  associatedData: string,
  nonce: string
): string {
  const client = getWechatClient()
  return client.decipher_gcm(
    ciphertext,
    associatedData,
    nonce,
    process.env.WECHAT_API_V3_KEY!
  )
}
