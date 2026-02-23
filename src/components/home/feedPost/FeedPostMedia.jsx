export default function FeedPostMedia({ mediaUrl, title }) {
  if (!mediaUrl) return null

  const ytMatch = mediaUrl.match(/(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1]
    return (
      <div className="mx-auto w-full">
        <iframe
          className="w-full"
          height="360"
          src={`https://www.youtube.com/embed/${id}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  const vimeoMatch = mediaUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1]
    return (
      <div className="mx-auto w-full">
        <iframe
          className="w-full"
          height="360"
          src={`https://player.vimeo.com/video/${id}`}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl)) {
    return <video src={mediaUrl} controls className="w-full h-auto mx-auto" />
  }

  return <img src={mediaUrl} className="mx-auto" alt={title || 'media'} />
}
