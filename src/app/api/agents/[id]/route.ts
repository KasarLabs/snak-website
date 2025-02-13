import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { data, error } = await supabase
      .from("agents")
      .select("config")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Agent configuration not found" },
        { status: 404 },
      );
    }

    // Return just the config object
    return NextResponse.json(data.config);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching agent configuration" },
      { status: 500 },
    );
  }
}
