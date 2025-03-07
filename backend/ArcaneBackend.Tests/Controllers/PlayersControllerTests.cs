using ArcaneBackend.API.Controllers;
using ArcaneBackend.Core.Entities;
using ArcaneBackend.Core.Enums;
using ArcaneBackend.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace ArcaneBackend.Tests.Controllers;

public class PlayersControllerTests
{
    private readonly Mock<IPlayerRepository> _mockRepo;
    private readonly PlayersController _controller;
    private readonly Guid _testPlayerId = Guid.NewGuid();

    public PlayersControllerTests()
    {
        _mockRepo = new Mock<IPlayerRepository>();
        _controller = new PlayersController(_mockRepo.Object);
    }

    [Fact]
    public async Task GetPlayers_ReturnsAllPlayers()
    {
        // Arrange
        var expectedPlayers = new List<Player>
        {
            new() { Id = _testPlayerId, DeviceId = "device1", Nickname = "Player1", DeviceType = DeviceType.Web },
            new() { Id = Guid.NewGuid(), DeviceId = "device2", Nickname = "Player2", DeviceType = DeviceType.Android }
        };
        _mockRepo.Setup(repo => repo.GetAllAsync())
            .ReturnsAsync(expectedPlayers);

        // Act
        var result = await _controller.GetPlayers();

        // Assert
        var actionResult = Assert.IsType<ActionResult<IEnumerable<Player>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var players = Assert.IsAssignableFrom<IEnumerable<Player>>(okResult.Value);
        Assert.Equal(expectedPlayers.Count, players.Count());
    }

    [Fact]
    public async Task GetPlayer_WithValidId_ReturnsPlayer()
    {
        // Arrange
        var expectedPlayer = new Player { Id = _testPlayerId, DeviceId = "device1", Nickname = "Player1", DeviceType = DeviceType.Web };
        _mockRepo.Setup(repo => repo.GetByIdAsync(_testPlayerId))
            .ReturnsAsync(expectedPlayer);

        // Act
        var result = await _controller.GetPlayer(_testPlayerId);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Player>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var player = Assert.IsType<Player>(okResult.Value);
        Assert.Equal(_testPlayerId, player.Id);
    }

    [Fact]
    public async Task GetPlayer_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockRepo.Setup(repo => repo.GetByIdAsync(_testPlayerId))
            .ReturnsAsync((Player?)null);

        // Act
        var result = await _controller.GetPlayer(_testPlayerId);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Player>>(result);
        Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    [Fact]
    public async Task CreatePlayer_WithValidPlayer_ReturnsCreatedAtAction()
    {
        // Arrange
        var playerToCreate = new Player { DeviceId = "device1", Nickname = "Player1", DeviceType = DeviceType.Web };
        var createdPlayer = new Player { Id = _testPlayerId, DeviceId = "device1", Nickname = "Player1", DeviceType = DeviceType.Web };
        _mockRepo.Setup(repo => repo.AddAsync(It.IsAny<Player>()))
            .ReturnsAsync(createdPlayer);

        // Act
        var result = await _controller.CreatePlayer(playerToCreate);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Player>>(result);
        var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        Assert.Equal(nameof(PlayersController.GetPlayer), createdAtActionResult.ActionName);
        var player = Assert.IsType<Player>(createdAtActionResult.Value);
        Assert.Equal(_testPlayerId, player.Id);
    }

    [Fact]
    public async Task UpdatePlayer_WithValidIdAndPlayer_ReturnsOkResult()
    {
        // Arrange
        var playerToUpdate = new Player { Id = _testPlayerId, DeviceId = "device1", Nickname = "UpdatedPlayer", DeviceType = DeviceType.Web };
        _mockRepo.Setup(repo => repo.UpdateAsync(It.IsAny<Player>()))
            .ReturnsAsync(playerToUpdate);

        // Act
        var result = await _controller.UpdatePlayer(_testPlayerId, playerToUpdate);

        // Assert
        var actionResult = Assert.IsType<ActionResult<Player>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var player = Assert.IsType<Player>(okResult.Value);
        Assert.Equal("UpdatedPlayer", player.Nickname);
    }

    [Fact]
    public async Task DeletePlayer_WithValidId_ReturnsNoContent()
    {
        // Arrange
        _mockRepo.Setup(repo => repo.DeleteAsync(_testPlayerId))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeletePlayer(_testPlayerId);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }
}