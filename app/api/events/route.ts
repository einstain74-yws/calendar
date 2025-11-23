import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET: 로그인한 사용자의 이벤트 조회
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "asc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("이벤트 조회 오류:", error)
    return NextResponse.json({ error: "이벤트를 불러오는데 실패했습니다." }, { status: 500 })
  }
}

// POST: 새 이벤트 생성
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const data = await request.json()
    const { title, startTime, endTime, description, location, date, color } = data

    if (!title || !startTime || !endTime || !date) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        startTime,
        endTime,
        description: description || "",
        location: location || "",
        date: new Date(date),
        color: color || "bg-blue-500",
        userId: session.user.id,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("이벤트 생성 오류:", error)
    return NextResponse.json({ error: "이벤트 생성에 실패했습니다." }, { status: 500 })
  }
}

