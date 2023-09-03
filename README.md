# File Renamer

...

## mp3.ts

- Read mp3 `id3` tags from a directory
- Give them a random order
- Rename them with the random order number prefix, then the title
- Create a `.m3u` playlist file, if `../playlists` directory exists

## mp4.ts

- Discover mp4 files from a directory
- Order them by the creation timestamp
- Rename them with a order number prefix, then the original name
- Filename will be auto transformed from traditional Chinese to simplified Chinese

## utime.ts

- Sync timestamps from `srcFile` to `dstFile`

