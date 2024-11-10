package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
)

type Converted struct {
	Img image.Image
	Mod color.Model
}

// At forwards the call to the original image and
// then asks the color model to convert it.
func (c *Converted) At(x, y int) color.Color {
	return c.Mod.Convert(c.Img.At(x, y))
}

// We return the new color model...
func (c *Converted) ColorModel() color.Model {
	return c.Mod
}

// ... but the original bounds
func (c *Converted) Bounds() image.Rectangle {
	return c.Img.Bounds()
}

func main() {
	lambda.Start(handler)
}

const inputFile = "/tmp/input.png"
const outputFile = "/tmp/processed.png"

func handler(ctx context.Context, s3Event events.S3Event) {
	sess := session.Must(session.NewSession(&aws.Config{Region: aws.String("us-east-1")}))
	downloader := s3manager.NewDownloader(sess)

	file, err := os.Create(inputFile)
	if err != nil {
		log.Fatalln(err)
	}

	for _, record := range s3Event.Records {
		record := record.S3

		bucketName := aws.String(record.Bucket.Name)
		objectKey := aws.String(record.Object.Key)
		fmt.Println("Downloading", objectKey, "from bucket", bucketName, "...")
		numBytes, err := downloader.Download(file, &s3.GetObjectInput{Bucket: bucketName, Key: objectKey})
		if err != nil {
			log.Fatalln(err)
		}

		fmt.Println("Downloaded", file.Name(), numBytes, "bytes")
		processImage()
		reuploadImage(record.Object.Key)
	}
}

func processImage() {
	// Open the file
	file, err := os.Open(inputFile)
	if err != nil {
		log.Fatalln(err)
	}

	defer file.Close()

	// Process the file
	img, _, err := image.Decode(file)
	if err != nil {
		log.Fatalln(err)
	}

	gr := &Converted{img, color.GrayModel}
	processed, err := os.Create(outputFile)
	if err != nil {
		log.Fatalln(err)
	}

	err = png.Encode(processed, gr)
	if err != nil {
		log.Fatalln(err)
	}
}

func reuploadImage(s3ObjectKey string) {
	outputBucket := os.Getenv("OUTPUT_BUCKET")

	// Open the file
	file, err := os.Open(outputFile)
	if err != nil {
		log.Fatalln(err)
	}

	defer file.Close()

	// Upload the file
	sess := session.Must(session.NewSession(&aws.Config{Region: aws.String("us-east-1")}))
	uploader := s3manager.NewUploader(sess)

	_, err = uploader.Upload(&s3manager.UploadInput{Bucket: aws.String(outputBucket), Key: aws.String(s3ObjectKey), Body: file})
	if err != nil {
		log.Fatalln(err)
	}
}
