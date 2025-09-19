import 'dotenv/config'
import { CognitoIdentityProviderClient, UpdateUserPoolCommand } from '@aws-sdk/client-cognito-identity-provider'

/*
Configures the Cognito User Pool email delivery to use Cognito default email (SES in AWS-owned account) or your SES identity.

Requires env:
- COGNITO_REGION
- COGNITO_USER_POOL_ID
Optional for SES mode:
- COGNITO_SES_FROM_ADDRESS (verified email in SES)
- COGNITO_SES_SOURCE_ARN (arn:aws:ses:region:account:identity/your-domain-or-email)
- COGNITO_SES_REPLY_TO_ADDRESS
- COGNITO_EMAIL_MODE = 'COGNITO' | 'SES' (default: COGNITO)
*/

async function main() {
  const REGION = process.env.COGNITO_REGION
  const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID
  const MODE = (process.env.COGNITO_EMAIL_MODE || 'COGNITO').toUpperCase()
  if (!REGION || !USER_POOL_ID) throw new Error('Missing COGNITO_REGION or COGNITO_USER_POOL_ID')

  const client = new CognitoIdentityProviderClient({ region: REGION })

  const input: any = {
    UserPoolId: USER_POOL_ID,
  }

  if (MODE === 'SES') {
    const FROM = process.env.COGNITO_SES_FROM_ADDRESS
    const SOURCE_ARN = process.env.COGNITO_SES_SOURCE_ARN
    const REPLY_TO = process.env.COGNITO_SES_REPLY_TO_ADDRESS
    if (!FROM || !SOURCE_ARN) {
      throw new Error('SES mode requires COGNITO_SES_FROM_ADDRESS and COGNITO_SES_SOURCE_ARN')
    }
    input.EmailConfiguration = {
      EmailSendingAccount: 'DEVELOPER',
      From: FROM,
      SourceArn: SOURCE_ARN,
      ReplyToEmailAddress: REPLY_TO,
    }
  } else {
    input.EmailConfiguration = {
      EmailSendingAccount: 'COGNITO_DEFAULT',
    }
  }

  const cmd = new UpdateUserPoolCommand(input)
  await client.send(cmd)
  console.log(`Updated email configuration for user pool ${USER_POOL_ID} using mode ${MODE}`)
}

main().catch((err) => {
  console.error('Failed to update Cognito email configuration:', err)
  process.exit(1)
})
