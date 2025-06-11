
import { useDownloads } from "@/hooks/useDownloads";
import { useRealtimeDownloads } from "@/hooks/useRealtimeDownloads";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const MyDownloads = () => {
  const { user } = useAuth();
  const { downloads, isLoading } = useDownloads();
  
  // Enable realtime updates
  useRealtimeDownloads();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your downloads.
            </p>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Downloads</h1>
              <p className="text-gray-600 mt-1">
                {downloads.length} {downloads.length === 1 ? 'book' : 'books'} downloaded
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {downloads.length === 0 ? (
          <div className="text-center py-12">
            <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No downloads yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring our library and download your first ebook!
            </p>
            <Link to="/">
              <Button>Browse Library</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((download) => (
              <Card key={download.id} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  {download.ebooks?.cover_image_url && (
                    <img
                      src={download.ebooks.cover_image_url}
                      alt={download.ebooks.title}
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                  )}
                  <CardTitle className="text-lg line-clamp-2">
                    {download.ebooks?.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    by {download.ebooks?.author}
                  </p>
                </CardHeader>
                
                <CardContent className="flex-1 pb-2">
                  <Badge variant="secondary" className="mb-2">
                    Downloaded {format(new Date(download.downloaded_at), 'MMM d, yyyy')}
                  </Badge>
                </CardContent>
                
                <CardContent className="pt-0">
                  {download.ebooks?.file_url && (
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = download.ebooks!.file_url!;
                        link.download = `${download.ebooks!.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyDownloads;
