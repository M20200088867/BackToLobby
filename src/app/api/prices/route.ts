import { NextRequest, NextResponse } from "next/server";
import { getGamePrices } from "@/lib/prices";

export async function GET(request: NextRequest) {
  try {
    const title = request.nextUrl.searchParams.get("title");

    if (!title) {
      return NextResponse.json(
        { error: "Missing title parameter" },
        { status: 400 }
      );
    }

    const deals = await getGamePrices(title);
    return NextResponse.json(deals);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Pricing request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
