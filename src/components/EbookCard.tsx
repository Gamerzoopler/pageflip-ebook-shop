
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Ebook } from "@/types/database";
import { DownloadButton } from "./DownloadButton";

interface EbookCardProps {
  ebook: Ebook;
  onAuthRequired: () => void;
  onPurchaseRequired: (ebook: { id: string; title: string; price: number; author: string; }) => void;
}

export const EbookCard = ({ ebook, onAuthRequired, onPurchaseRequired }: EbookCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        {ebook.cover_image_url && (
          <img
            src={ebook.cover_image_url}
            alt={ebook.title}
            className="w-full h-48 object-cover rounded-md mb-2"
          />
        )}
        <CardTitle className="text-lg line-clamp-2">{ebook.title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {ebook.author}</p>
      </CardHeader>
      
      <CardContent className="flex-1 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
          {ebook.description}
        </p>
        
        <div className="flex items-center gap-2 mb-2">
          {ebook.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{ebook.rating}</span>
            </div>
          )}
          {ebook.pages && (
            <span className="text-xs text-muted-foreground">{ebook.pages} pages</span>
          )}
        </div>
        
        {ebook.categories && (
          <Badge variant="secondary" className="mb-2">
            {ebook.categories.name}
          </Badge>
        )}
        
        {ebook.is_featured && (
          <Badge className="mb-2">Featured</Badge>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <span className="text-lg font-semibold">${ebook.price?.toFixed(2) || '0.00'}</span>
          {ebook.language && (
            <span className="text-xs text-muted-foreground">{ebook.language}</span>
          )}
        </div>
        <DownloadButton 
          fileUrl={ebook.file_url} 
          title={ebook.title}
          ebookId={ebook.id}
          price={ebook.price || 0}
          author={ebook.author}
          onAuthRequired={onAuthRequired}
          onPurchaseRequired={onPurchaseRequired}
        />
      </CardFooter>
    </Card>
  );
};
