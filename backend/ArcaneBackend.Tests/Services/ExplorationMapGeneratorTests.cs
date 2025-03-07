using System.Linq;
using ArcaneBackend.Core.Models;
using ArcaneBackend.Core.Services;
using Xunit;

namespace ArcaneBackend.Tests.Services
{
    public class ExplorationMapGeneratorTests
    {
        [Theory]
        [InlineData(2)]
        [InlineData(5)]
        [InlineData(10)]
        public void Generate_CreatesValidMap_WithCorrectLevels(int maxLevel)
        {
            // Arrange
            var generator = new ExplorationMapGenerator(seed: 42); // 決定論的なテストのため

            // Act
            var map = generator.Generate(maxLevel);

            // Assert
            Assert.NotNull(map);
            Assert.NotEmpty(map.Id);

            // 各レベルにノードが存在することを確認
            for (int level = 0; level <= maxLevel; level++)
            {
                var nodesAtLevel = map.GetNodesAtLevel(level).ToList();
                Assert.NotEmpty(nodesAtLevel);

                // レベル0は必ず中央レーン
                if (level == 0)
                {
                    Assert.Single(nodesAtLevel);
                    Assert.Equal(Lane.Center, nodesAtLevel[0].Lane);
                }

                // 最終レベルは必ず中央レーン
                if (level == maxLevel)
                {
                    Assert.Single(nodesAtLevel);
                    Assert.Equal(Lane.Center, nodesAtLevel[0].Lane);
                }
            }
        }

        [Fact]
        public void Generate_CreatesValidPaths_BetweenNodes()
        {
            // Arrange
            var generator = new ExplorationMapGenerator(seed: 42);

            // Act
            var map = generator.Generate(maxLevel: 3);
            var allNodes = map.GetAllNodes().ToList();

            // Assert
            // 全てのノードが少なくとも1つのパスを持つ（最終ノード以外）
            foreach (var node in allNodes.Where(n => n.Level < 3))
            {
                Assert.NotEmpty(node.OutgoingPaths);
            }

            // パスの接続先が適切か確認
            foreach (var node in allNodes)
            {
                foreach (var path in node.OutgoingPaths)
                {
                    // パスは必ず次のレベルに接続
                    Assert.Equal(node.Level + 1, path.ToNode.Level);

                    // レーン間の移動は1つまで
                    Assert.True(
                        System.Math.Abs((int)node.Lane - (int)path.ToNode.Lane) <= 1,
                        "Invalid lane movement detected"
                    );
                }
            }
        }

        [Fact]
        public void Generate_CreatesNodesWithCorrectTypes()
        {
            // Arrange
            var generator = new ExplorationMapGenerator(seed: 42);

            // Act
            var map = generator.Generate(maxLevel: 5);
            var allNodes = map.GetAllNodes().ToList();

            // Assert
            // 開始ノードは必ずBasic
            var startNode = allNodes.Single(n => n.Level == 0);
            Assert.Equal(NodeType.Basic, startNode.Type);

            // 終了ノードは必ずBasic
            var endNode = allNodes.Single(n => n.Level == 5);
            Assert.Equal(NodeType.Basic, endNode.Type);

            // 中間ノードは全てのタイプが存在する
            var middleNodes = allNodes.Where(n => n.Level > 0 && n.Level < 5);
            Assert.Contains(middleNodes, n => n.Type == NodeType.Battle);
            Assert.Contains(middleNodes, n => n.Type == NodeType.SafeHaven);
            Assert.Contains(middleNodes, n => n.Type == NodeType.Basic);
        }
    }
}