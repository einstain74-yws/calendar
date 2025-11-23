import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// PATCH: 이벤트 수정
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    // 이벤트가 존재하고 해당 사용자의 것인지 확인
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "이벤트를 찾을 수 없습니다." }, { status: 404 })
    }

    if (existingEvent.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const { title, startTime, endTime, description, location, date, color } = data

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: title || existingEvent.title,
        startTime: startTime || existingEvent.startTime,
        endTime: endTime || existingEvent.endTime,
        description: description !== undefined ? description : existingEvent.description,
        location: location !== undefined ? location : existingEvent.location,
        date: date ? new Date(date) : existingEvent.date,
        color: color || existingEvent.color,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("이벤트 수정 오류:", error)
    return NextResponse.json({ error: "이벤트 수정에 실패했습니다." }, { status: 500 })
  }
}

// DELETE: 이벤트 삭제
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const { id } = params

    // 이벤트가 존재하고 해당 사용자의 것인지 확인
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "이벤트를 찾을 수 없습니다." }, { status: 404 })
    }

    if (existingEvent.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ message: "이벤트가 삭제되었습니다." })
  } catch (error) {
    console.error("이벤트 삭제 오류:", error)
    return NextResponse.json({ error: "이벤트 삭제에 실패했습니다." }, { status: 500 })
  }
}

