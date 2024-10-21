package integration

import (
	"di-iot-serving/service"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strconv"
)

type GinHttpIntegration struct {
	Integration // Embedding

	Port string
}

func (g *GinHttpIntegration) Run(blac service.ServingService) {
	r := g.SetupHttpServer(blac)
	log.Fatal(r.Run(fmt.Sprintf(":%s", g.Port)), nil)
}

func (g *GinHttpIntegration) SetupHttpServer(blac service.ServingService) *gin.Engine {
	r := gin.Default()

	r.GET("/devices", func(c *gin.Context) {
		devices := blac.Devices()
		c.JSON(http.StatusOK, gin.H{
			"devices": devices,
		})
	})

	r.GET("/devices/:device", func(c *gin.Context) {
		device := c.Param("device")
		v, err := blac.VectorLength(device)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"device":        device,
			"vector_length": v,
		})
	})

	r.POST("/devices/:device/connect", func(c *gin.Context) {
		device := c.Param("device")
		email := c.PostForm("email")
		err := blac.ConnectDevice(device, email)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"device_id": device,
			"email":     email,
		})
	})

	r.POST("/devices/:device/configure", func(c *gin.Context) {
		device := c.Param("device")
		threshold, err := strconv.ParseFloat(c.PostForm("threshold"), 64)
		err = blac.ConfigureDeviceThreshold(device, threshold)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"device_id": device,
			"threshold": threshold,
		})
	})

	r.GET("/devices/connections", func(c *gin.Context) {
		devices := blac.AllConnections()
		c.JSON(http.StatusOK, gin.H{
			"connections": devices,
		})
	})

	r.GET("/devices/thresholds", func(c *gin.Context) {
		thresholds := blac.AllThresholds()
		c.JSON(http.StatusOK, gin.H{
			"thresholds": thresholds,
		})
	})

	return r
}
