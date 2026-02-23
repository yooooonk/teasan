import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30일

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const password = typeof body.password === 'string' ? body.password : ''

    const appPassword = process.env.APP_PASSWORD
    const authSecret = process.env.AUTH_SECRET

    if (!appPassword || !authSecret) {
      return NextResponse.json(
        { ok: false, error: '서버 설정이 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    if (password !== appPassword) {
      return NextResponse.json(
        { ok: false, error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(AUTH_COOKIE_NAME, authSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json(
      { ok: false, error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
