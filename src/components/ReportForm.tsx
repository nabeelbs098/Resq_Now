import { useState, useRef, useCallback } from "react";
import { Camera, Upload, MapPin, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadAccidentImage, db } from "@/lib/supabase-helpers";
import { toast } from "sonner";

export default function ReportForm() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Location detected");
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === 1
            ? "Location permission denied. Please enable it in your browser settings."
            : "Could not get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = async () => {
    if (!location) {
      toast.error("Please get your location first");
      return;
    }
    setSubmitting(true);

    let photoUrl: string | null = null;
    if (photo) {
      photoUrl = await uploadAccidentImage(photo);
      if (!photoUrl) {
        toast.error("Failed to upload image. Report submitted without photo.");
      }
    }

    const { error } = await db.reports().insert({
      photo_url: photoUrl,
      latitude: location.lat,
      longitude: location.lng,
      description: description || null,
      status: "pending",
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit report. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
      toast.success("Report submitted successfully!");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Report Submitted</h2>
          <p className="mt-2 text-muted-foreground">
            Emergency services have been notified. Help is on the way.
          </p>
        </div>
        <Button
          onClick={() => {
            setSubmitted(false);
            setPhoto(null);
            setPhotoPreview(null);
            setDescription("");
            setLocation(null);
          }}
          variant="outline"
          size="lg"
        >
          Submit Another Report
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Section */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Photo Evidence
        </label>
        {photoPreview ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            <img src={photoPreview} alt="Preview" className="w-full max-h-64 object-cover" />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => { setPhoto(null); setPhotoPreview(null); }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-28 flex-col gap-2 border-dashed border-2"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="h-28 flex-col gap-2 border-dashed border-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Upload</span>
            </Button>
          </div>
        )}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Location
        </label>
        {location ? (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm">
            <MapPin className="h-5 w-5 text-success" />
            <span className="font-mono text-success">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </span>
          </div>
        ) : (
          <Button
            onClick={getLocation}
            disabled={locating}
            variant="outline"
            className="w-full h-14 text-base"
          >
            {locating ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-5 w-5 text-primary" />
            )}
            {locating ? "Detecting Location..." : "Get Current Location"}
          </Button>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Description (Optional)
        </label>
        <Textarea
          placeholder="Describe the accident, number of people involved, severity..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none text-base"
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!location || submitting}
        size="lg"
        className="w-full h-14 text-lg font-bold emergency-glow"
      >
        {submitting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <AlertTriangle className="mr-2 h-5 w-5" />
        )}
        {submitting ? "Submitting..." : "Report Accident"}
      </Button>
    </div>
  );
}
