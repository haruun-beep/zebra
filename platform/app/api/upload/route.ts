import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const jobId = formData.get("jobId") as string;
  const caption = formData.get("caption") as string | null;

  if (!file || !jobId) {
    return NextResponse.json({ error: "Missing file or jobId" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const fileName = `${jobId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("job-photos")
    .upload(fileName, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from("job-photos")
    .getPublicUrl(fileName);

  const { data: photo, error: dbError } = await supabase
    .from("job_photos")
    .insert({
      job_id: jobId,
      url: publicUrl.publicUrl,
      caption: caption ?? null,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ photo });
}
