import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { data, error } = await supabase
      .from("agents")
      .select("config")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") {
      return NextResponse.json(
        { error: "Agent configuration not found" },
        { status: 404 },
      );
    }
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Error fetching agent configuration" },
        { status: 500 },
      );
    }

    return NextResponse.json(data.config);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching agent configuration" },
      { status: 500 },
    );
  }
}
